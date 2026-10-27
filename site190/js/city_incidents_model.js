/* Position-evidenced city response rules. No timer can arrive, arrest or transport an actor. */
(function(root){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x)),plain=x=>!!x&&Object.getPrototypeOf(x)===Object.prototype,exact=(x,keys)=>plain(x)&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
 const time=n=>Number.isFinite(n)&&n>=0&&n<=1e12,id=s=>typeof s==='string'&&s.length>0&&s.length<=100,point=p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<=1000),scene=s=>typeof s==='string'&&s.length>0&&s.length<=100,near=(a,b,r)=>point(a)&&point(b)&&Math.hypot(a[0]-b[0],a[1]-b[1])<=r;
 const DEFAULT_FACILITIES={station:{position:[100.5,34.1],scene:'street'},hospital:{position:[-20,-1.5],scene:'street'},morgue:{position:[-20,-1.5],scene:'street'}};
 function facilitiesValid(f){return plain(f)&&Object.keys(f).every(k=>['station','hospital','morgue'].includes(k)&&exact(f[k],['position','scene'])&&point(f[k].position)&&scene(f[k].scene));}
 function fresh(seed=1,facilities=DEFAULT_FACILITIES){if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295||!facilitiesValid(facilities))throw Error('城市事件初始配置无效');return {version:1,seed,cursor:0,nextIncidentId:1,nextDispatchId:1,facilities:copy(facilities),actors:{},incidents:[],dispatches:[],journal:[]};}
 const role=s=>['civilian','criminal','police','medic'].includes(s),personality=s=>['calm','aggressive'].includes(s);
 function commandValid(c){
  if(!plain(c)||typeof c.type!=='string')return false;
  const shapes={opportunity:[],register:['id','role','personality'],crime:['kind','offenderId','victimId','offender','victim','scene'],collision:['victimId','vehicleId','speedMps','contact','vehicle','victim','scene'],reportPolice:['incidentId','witnessId','witness','target','visible','scene'],witnessCall:['incidentId','witnessId','witness','target','visible','scene'],dispatch:['incidentId','unitId','vehicleId'],arrive:['dispatchId','unit','target','scene'],cuff:['incidentId','unit','offender','scene'],beginEscort:['incidentId','unit','offender','scene'],station:['incidentId','unit','offender','scene'],selfAid:['incidentId'],evaluate:['incidentId','unit','patient','scene'],advance:[],stretcher:['incidentId','unit','patient','scene'],cover:['incidentId','unit','patient','scene'],load:['incidentId','unit','patient','vehicle','scene'],transport:['incidentId','vehicle','scene'],propertyTake:['incidentId','item','receiptId','offender','victim','scene'],propertySeize:['incidentId','unit','offender','scene'],propertyReturn:['incidentId','receiptId','unit','victim','scene']};
  const fields=shapes[c.type];if(!fields||!exact(c,['type',...fields]))return false;
  for(const k of ['incidentId','dispatchId'])if(k in c&&(!Number.isSafeInteger(c[k])||c[k]<1||c[k]>24))return false;
  for(const k of ['offenderId','victimId','witnessId','unitId'])if(k in c&&!id(c[k]))return false;
  for(const k of ['offender','victim','witness','target','unit','patient','vehicle'])if(k in c&&!point(c[k]))return false;
  if('scene'in c&&!scene(c.scene))return false;
  if('receiptId'in c&&(!Number.isSafeInteger(c.receiptId)||c.receiptId<1||c.receiptId>4096))return false;if(c.type==='propertyTake'&&!['bread','drink'].includes(c.item))return false;
  if(c.type==='register')return id(c.id)&&role(c.role)&&personality(c.personality);
  if(c.type==='crime')return ['assault','theft'].includes(c.kind);
  if(c.type==='collision')return id(c.vehicleId)&&Number.isFinite(c.speedMps)&&c.speedMps>=1.5&&c.speedMps<=30&&c.contact===true;
  if(c.type==='dispatch')return c.vehicleId===null||id(c.vehicleId);
  if(['reportPolice','witnessCall'].includes(c.type))return c.visible===true;
  return true;
 }
 const fail=reason=>({ok:false,reason});
 function transition(s,c,at){
  if(!commandValid(c)||!time(at)||s.journal.length&&at<s.journal.at(-1).at)return fail('事件输入或时序无效');
  const actor=k=>Object.hasOwn(s.actors,k)?s.actors[k]:null,find=n=>s.incidents.find(i=>i.id===n),dispatch=i=>s.dispatches.find(d=>d.id===i.dispatchId),i=find(c.incidentId),event={type:c.type};
  if(c.type==='opportunity'){event.sample=opportunity(s);s.cursor++;return {ok:true,event};}
  if(c.type==='register'){
   if(Object.keys(s.actors).length>=32||actor(c.id))return fail('人物已经登记或登记数量已达上限');
   Object.defineProperty(s.actors,c.id,{value:{id:c.id,role:c.role,personality:c.personality,health:100,injury:'none',lastCrimeAt:null},enumerable:true,writable:true,configurable:true});return {ok:true,event};
  }
  if(['crime','collision'].includes(c.type)){
   if(s.incidents.length>=24)return fail('事件记录已达24条上限，不会删除旧事实');
   const victim=actor(c.victimId);if(!victim||victim.injury==='deceased'||victim.health<=0)return fail('伤者身份或健康状态无效');
   let damage=0,offender=null;
   if(c.type==='crime'){
    offender=actor(c.offenderId);if(!offender||!['civilian','criminal'].includes(offender.role)||offender.health<=0||c.offenderId===c.victimId||!near(c.offender,c.victim,1.6))return fail('没有有效的近距离犯罪事实');
    if(offender.lastCrimeAt!==null&&at-offender.lastCrimeAt<30||s.incidents.some(q=>q.offenderId===offender.id&&q.status!=='station'))return fail('同一人的犯罪机会仍在冷却或处置中');
    damage=c.kind==='assault'?12:0;
   }else{
    if(!near(c.vehicle,c.victim,3.4)||s.incidents.some(q=>q.kind==='collision'&&q.victimId===victim.id&&!['hospital','morgue'].includes(q.status)))return fail('没有有效车辆接触或伤者已有未结事件');
    // Tuned game tiers for this street's 4.5–6.5 m/s traffic; not medical risk estimates.
    damage=c.speedMps<3?8:c.speedMps<4.5?25:c.speedMps<6?60:95;
   }
   victim.health=Math.max(0,victim.health-damage);const severity=damage===0?'none':victim.health<=15?'critical':victim.health<=50?'serious':'minor';if(damage)victim.injury=severity;if(offender)offender.lastCrimeAt=at;
   const incident={id:s.nextIncidentId++,kind:c.type,crimeKind:c.type==='crime'?c.kind:null,offenderId:offender?.id||null,victimId:victim.id,vehicleId:c.type==='collision'?c.vehicleId:null,scene:c.scene,position:copy(c.victim),at,damage,severity,status:c.type==='crime'?'observed':'injured',reportedAt:null,calledAt:null,selfAidAt:null,dispatchId:null,assessedAt:null,treatUntil:null,outcome:null,completedAt:null};
   s.incidents.push(incident);s.cursor++;event.incidentId=incident.id;return {ok:true,event};
  }
  if(c.type==='advance'){
   let changed=false;for(const q of s.incidents)if(q.status==='treating'&&at>=q.treatUntil&&actor(dispatch(q)?.unitId)?.health>0){changed=true;const a=actor(q.victimId),deceased=q.severity==='critical'&&q.treatUntil-q.at>=(q.selfAidAt===null?45:60);q.outcome=deceased?'deceased':'rescued';q.status=q.outcome;a.health=deceased?0:Math.min(100,Math.max(a.health,25));a.injury=deceased?'deceased':'stabilized';}
   event.changed=changed;return {ok:true,event};
  }
  if(c.type==='arrive'){
   const d=s.dispatches.find(d=>d.id===c.dispatchId),q=d&&find(d.incidentId);if(!d||d.phase!=='enroute'||!q||actor(d.unitId)?.health<=0||c.scene!==q.scene||!near(c.unit,c.target,1.8)||d.kind==='ems'&&!near(c.target,q.position,1.5))return fail('到场需要实际同场接近，计时不能代替');
   d.phase='onscene';d.arrivedAt=at;q.status=d.kind==='police'?'police_onscene':'ems_onscene';event.incidentId=q.id;event.dispatchId=d.id;return {ok:true,event};
  }
  if(!i)return fail('事件不存在');event.incidentId=i.id;
  const patient=actor(i.victimId),d=dispatch(i);
  if(['reportPolice','witnessCall'].includes(c.type)){
   const witness=actor(c.witnessId),police=c.type==='reportPolice';if(!witness||witness.health<=0||witness.injury==='deceased'||c.witnessId===i.offenderId||c.scene!==i.scene||!near(c.witness,c.target,12)||!near(c.target,i.position,3.4)||i.status!==(police?'observed':'injured')||i.kind!==(police?'crime':'collision'))return fail('报告需要近处可见的真实目击与未报告事件');
   if(police){i.reportedAt=at;i.status='reported';}else{i.calledAt=at;i.status='ems_called';}return {ok:true,event};
  }
  if(c.type==='propertyTake'){
   if(i.kind!=='crime'||i.crimeKind!=='theft'||i.property||i.status!=='observed'||at!==i.at||c.scene!==i.scene||!['daily_wen','daily_shen'].includes(i.victimId)||!near(c.offender,c.victim,1.6)||!near(c.victim,i.position,.01))return fail('财物转移须对应当前真实近距事件和原居民物品收据');i.property={item:c.item,lossReceiptId:c.receiptId,lossAt:at,custody:'offender',seizedAt:null,returnedAt:null,returnReceiptId:null};return {ok:true,event};
  }
  if(c.type==='propertySeize'){
   if(!i.property||i.property.custody!=='offender'||i.status!=='cuffed'||!d||c.scene!==i.scene||!near(c.unit,c.offender,1.35)||actor(d.unitId)?.health<=0)return fail('追缴需要近处警员、已受控制的当事人与实际在身物品');i.property.custody='police';i.property.seizedAt=at;return {ok:true,event};
  }
  if(c.type==='propertyReturn'){
   const f=s.facilities.station;if(!i.property||i.property.custody!=='police'||!['cuffed','station'].includes(i.status)||!d||actor(d.unitId)?.health<=0||patient.health<=0||c.scene!==i.scene||!near(c.unit,c.victim,1.35)||i.status==='station'&&!near(c.unit,f.position,1.5))return fail('返还需要警方与原主实际近距交接');i.property.custody='returned';i.property.returnedAt=at;i.property.returnReceiptId=c.receiptId;return {ok:true,event};
  }
  if(c.type==='selfAid'){
   if(i.kind!=='collision'||patient.health<=0||i.selfAidAt!==null||!['injured','ems_called','ems_enroute','ems_onscene'].includes(i.status))return fail('当前伤情不能重复自救');i.selfAidAt=at;return {ok:true,event};
  }
  if(c.type==='dispatch'){
   const unit=actor(c.unitId),police=i.kind==='crime';if(!unit||unit.health<=0||unit.role!==(police?'police':'medic')||i.status!==(police?'reported':'ems_called')||s.dispatches.length>=24||s.dispatches.some(q=>q.unitId===unit.id&&q.phase!=='complete')||!police&&!id(c.vehicleId))return fail('没有有效出勤人员、车辆或可派遣报告');
   const entry={id:s.nextDispatchId++,incidentId:i.id,kind:police?'police':'ems',unitId:unit.id,vehicleId:c.vehicleId,phase:'enroute',assignedAt:at,arrivedAt:null,completedAt:null};s.dispatches.push(entry);i.dispatchId=entry.id;i.status=police?'police_enroute':'ems_enroute';event.dispatchId=entry.id;return {ok:true,event};
  }
  if(!d||actor(d.unitId)?.health<=0)return fail('事件尚未派遣健康的实际人员');
  if(c.type==='cuff'||c.type==='beginEscort'){
   if(i.kind!=='crime'||i.status!==(c.type==='cuff'?'police_onscene':'cuffed')||c.scene!==i.scene||!near(c.unit,c.offender,1.35)||actor(i.offenderId).health<=0)return fail('控制或押送须由近处警员实际完成');i.status=c.type==='cuff'?'cuffed':'escorting';if(c.type==='beginEscort')d.phase='escorting';return {ok:true,event};
  }
  if(c.type==='station'){
   const f=s.facilities.station;if(i.status!=='escorting'||!f||c.scene!==f.scene||!near(c.unit,f.position,1.5)||!near(c.offender,f.position,1.5))return fail('双方尚未实际抵达警务站');i.status='station';i.completedAt=at;d.phase='complete';d.completedAt=at;return {ok:true,event};
  }
  if(c.type==='evaluate'){
   if(i.kind!=='collision'||i.status!=='ems_onscene'||c.scene!==i.scene||!near(c.unit,c.patient,1.35)||!near(c.patient,i.position,1.5))return fail('医护必须到伤者身边实际检查');i.assessedAt=at;i.treatUntil=at+5;if(!time(i.treatUntil))return fail('治疗时间越界');i.status='treating';return {ok:true,event};
  }
  if(c.type==='stretcher'||c.type==='cover'){
   if(i.status!==(c.type==='stretcher'?'rescued':'deceased')||c.scene!==i.scene||!near(c.unit,c.patient,1.35)||!near(c.patient,i.position,1.5))return fail('担架或白布需要现场医护及已核实结果');i.status=c.type==='stretcher'?'stretcher':'covered';return {ok:true,event};
  }
  if(c.type==='load'){
   if(!['stretcher','covered'].includes(i.status)||c.scene!==i.scene||!near(c.unit,c.patient,1.5)||!near(c.vehicle,c.patient,3.4))return fail('装车需要担架或覆布状态及真实车辆接近');i.status='loaded';d.phase='transporting';return {ok:true,event};
  }
  if(c.type==='transport'){
   const destination=i.outcome==='deceased'?'morgue':'hospital',f=s.facilities[destination];if(i.status!=='loaded'||!f||c.scene!==f.scene||!near(c.vehicle,f.position,1.8))return fail('车辆尚未实际抵达转院交接点');i.status=destination;i.completedAt=at;d.phase='complete';d.completedAt=at;return {ok:true,event};
  }
  return fail('当前阶段不接受此操作');
 }
 function replay(s,at){
  if(!exact(s,['version','seed','cursor','nextIncidentId','nextDispatchId','facilities','actors','incidents','dispatches','journal'])||s.version!==1||!Array.isArray(s.journal)||s.journal.length>512||!plain(s.actors)||Object.keys(s.actors).length>32||!Array.isArray(s.incidents)||s.incidents.length>24||!Array.isArray(s.dispatches)||s.dispatches.length>24||!facilitiesValid(s.facilities)||at!==undefined&&!time(at))return null;
  const n=fresh(s.seed,s.facilities);for(const row of s.journal){if(!exact(row,['at','command'])||!time(row.at)||at!==undefined&&row.at>at||JSON.stringify(row.command).length>4000)return null;const r=transition(n,row.command,row.at);if(!r.ok)return null;n.journal.push(copy(row));}return n;
 }
 function canonical(x){return Array.isArray(x)?x.map(canonical):plain(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;}
 function validate(s,at){try{const n=replay(s,at);return !!n&&JSON.stringify(canonical(n))===JSON.stringify(canonical(s));}catch(_){return false;}}
 function normalize(s,at){return validate(s,at)?copy(s):null;}
 function apply(s,command,at){
  if(!validate(s,at)||!commandValid(command))return fail('城市事件记录或请求无效');if(s.journal.length>=512)return fail('事件过程记录已达上限，不会删除旧事实');
  const next=copy(s),r=transition(next,copy(command),at);if(!r.ok)return r;if(command.type==='advance'&&!r.event.changed)return {ok:true,state:next,event:r.event};next.journal.push({at,command:copy(command)});return {ok:true,state:next,event:r.event};
 }
 // Replay prefixes: later rescue/death must never rewrite an earlier experience.
 // Health recall covers minor >50-health participation; scene recall only actual >50-health reporters.
 // Neither implies consciousness modeling, seeing the original impact, or knowing later outcomes.
 function personalExperienceFacts(s,at){
  if(!validate(s,at))return null;const n=fresh(s.seed,s.facilities),facts=[];
  for(let index=0;index<s.journal.length;index++){
   const row=s.journal[index],c=row.command,before=new Map(n.incidents.map(i=>[i.id,i.status]));
   const result=transition(n,c,row.at);if(!result.ok)return null;n.journal.push(copy(row));
   if(['reportPolice','witnessCall'].includes(c.type)){const i=n.incidents.find(i=>i.id===c.incidentId),a=n.actors[c.witnessId];if(i&&a?.health>50&&c.witnessId!==i.victimId&&c.witnessId!==i.offenderId)facts.push({key:'cityWitness:'+(index+1)+':'+c.witnessId,domain:'cityWitness',sourceId:index+1,actorId:c.witnessId,at:row.at,kind:c.type==='witnessCall'?'seen_aid':'seen_report',importance:7,incidentId:i.id,text:c.type==='witnessCall'?'我在现场看见需要救助的当事人，并拨打了急救求助电话；这不表示我目睹了碰撞全过程，也不知道后来的救治结果。':'我在现场看见当事人，并向警方报告了情况；这不表示我目睹了事发全过程，也不能凭报告认定谁应负责。'});}
   const changed=c.type==='advance'?n.incidents.filter(i=>before.get(i.id)==='treating'&&i.status==='rescued'):n.incidents.filter(i=>i.id===result.event.incidentId);
   for(const i of changed){if(i.severity!=='minor'||n.actors[i.victimId].health<=50)continue;let kind,text;
    if(['collision','crime'].includes(c.type)&&i.damage>0){kind='health_injury';text=i.kind==='collision'?'我被车辆碰伤了，这次记录为轻伤。':'我被人打伤了，这次记录为轻伤。';}
    else if(c.type==='selfAid'){kind='health_self_aid';text='受伤后，我在现场做了自救；这不等于伤已经好了。';}
    else if(c.type==='evaluate'){kind='health_care';text='医护实际到我身边检查，并开始现场处理。';}
    else if(c.type==='advance'){kind='health_stabilized';text='这次现场处理已完成，伤情记录转为稳定；不等于痊愈或可以复工。';}
    else if(c.type==='stretcher'){kind='health_stretcher';text='医护实际把我安置到担架上。';}
    else if(c.type==='load'){kind='health_transport';text='我已被实际装上救护车，尚不代表抵达医院。';}
    else if(c.type==='transport'&&i.status==='hospital'){kind='health_hospital';text='救护车实际抵达医院交接点；没有出院或痊愈记录。';}
    if(kind)facts.push({key:'cityHealth:'+(index+1)+':'+i.victimId,domain:'cityHealth',sourceId:index+1,actorId:i.victimId,at:row.at,kind,importance:9,incidentId:i.id,text});
   }
  }return facts;
 }
 function personalHealthFacts(s,at){const facts=personalExperienceFacts(s,at);return facts&&facts.filter(f=>f.domain==='cityHealth');}
 function opportunity(s){return ((Math.imul((s.seed^s.cursor)>>>0,1664525)+1013904223)>>>0)/4294967296;}
 const api={fresh,validate,normalize,apply,opportunity,personalHealthFacts,personalExperienceFacts};root.CityIncidentsModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
