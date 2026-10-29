/* Physical-adapter parking rules only; not bootstrapped into the game. */
(function(root){'use strict';
 const BAY='P-W01',LIMIT=120,HISTORY=16,MAX=1e12;
 const clone=x=>JSON.parse(JSON.stringify(x)),exact=(o,k)=>o&&Object.getPrototypeOf(o)===Object.prototype&&Object.keys(o).sort().join(',')===k.slice().sort().join(',');
 const time=n=>Number.isFinite(n)&&n>=0&&n<=MAX,int=n=>Number.isSafeInteger(n)&&n>=0&&n<=MAX,vehicle=id=>typeof id==='string'&&/^car[1-9][0-9]{0,11}$/.test(id);
 const fresh=()=>({version:1,nextVisitId:1,active:null,history:[]});
 function validate(s,at){
  if(!exact(s,['version','nextVisitId','active','history'])||s.version!==1||!int(s.nextVisitId)||s.nextVisitId<1||!Array.isArray(s.history)||s.history.length>HISTORY||(at!==undefined&&!time(at)))return false;
  function base(v){return int(v.id)&&v.id>0&&v.id<s.nextVisitId&&vehicle(v.vehicleId)&&v.bayId===BAY&&time(v.enteredAt)&&(at===undefined||v.enteredAt<=at);}
  const total=s.nextVisitId-1-(s.active?1:0),n=Math.min(total,HISTORY);if(total<0||s.history.length!==n)return false;
  let previousEnd=-1;
  for(let i=0;i<n;i++){const h=s.history[i];if(!exact(h,['id','vehicleId','bayId','enteredAt','endedAt','elapsed','warningAt'])||!base(h)||h.id!==total-n+1+i||!time(h.endedAt)||h.endedAt<h.enteredAt||h.enteredAt<previousEnd||(at!==undefined&&h.endedAt>at)||!time(h.elapsed)||Math.abs(h.elapsed-(h.endedAt-h.enteredAt))>1e-6||!validWarning(h,h.endedAt))return false;previousEnd=h.endedAt;}
  if(s.active){const a=s.active;if(!exact(a,['id','vehicleId','bayId','enteredAt','observedAt','phase','warningAt'])||!base(a)||a.id!==s.nextVisitId-1||a.enteredAt<previousEnd||!time(a.observedAt)||a.observedAt<a.enteredAt||(at!==undefined&&a.observedAt>at)||!['parked','departing'].includes(a.phase)||!validWarning(a,a.observedAt))return false;}
  return true;
 }
 function validWarning(v,end){return v.warningAt===null?end<v.enteredAt+LIMIT:time(v.warningAt)&&v.warningAt>=v.enteredAt+LIMIT&&v.warningAt<=end;}
 const normalize=(s,at)=>validate(s,at)?clone(s):null;
 function create(adapter,initial=fresh()){
  if(!adapter||typeof adapter.now!=='function'||typeof adapter.inspect!=='function')throw Error('Parking requires physical inspect and game clock adapters.');
  let state=normalize(initial,adapter.now());if(!state)throw Error('Invalid parking state.');
  function physical(id){const p=adapter.inspect(id,BAY);return p&&p.vehicleId===id&&typeof p.exists==='boolean'&&typeof p.stopped==='boolean'&&typeof p.contained==='boolean'&&typeof p.overlaps==='boolean'&&typeof p.legal==='boolean'&&Array.isArray(p.occupants)&&p.occupants.every(vehicle)?p:null;}
  function fail(reason){return{ok:false,reason};}
  function enter(id,bayId=BAY){const now=adapter.now();if(!vehicle(id)||bayId!==BAY||!time(now))return fail('invalid_vehicle_bay_or_clock');const p=physical(id);if(!p||!p.exists||!p.stopped||!p.contained||!p.overlaps||!p.legal)return fail('physical_parking_not_confirmed');if(p.occupants.some(x=>x!==id))return fail('bay_occupied');if(state.active)return state.active.vehicleId===id?{ok:true,duplicate:true,id:state.active.id}:fail('bay_occupied');if(state.nextVisitId>=MAX)return fail('visit_capacity_exhausted');if(state.history.length&&now<state.history.at(-1).endedAt)return fail('clock_reversed');const visitId=state.nextVisitId++;state.active={id:visitId,vehicleId:id,bayId:BAY,enteredAt:now,observedAt:now,phase:'parked',warningAt:null};return{ok:true,id:visitId};}
  function update(){const now=adapter.now(),a=state.active;if(!time(now))return fail('invalid_clock');if(!a)return{ok:true,changed:false};if(now<a.observedAt)return fail('clock_reversed');const p=physical(a.vehicleId);if(!p||!p.exists)return fail('physical_vehicle_missing');let warning=null;if(a.warningAt===null&&now>=a.enteredAt+LIMIT){a.warningAt=now;warning={id:a.id,vehicleId:a.vehicleId,bayId:BAY,elapsed:now-a.enteredAt};}a.observedAt=now;if(!p.overlaps){const h={id:a.id,vehicleId:a.vehicleId,bayId:BAY,enteredAt:a.enteredAt,endedAt:now,elapsed:now-a.enteredAt,warningAt:a.warningAt};state.history.push(h);if(state.history.length>HISTORY)state.history.shift();state.active=null;return{ok:true,warning,departed:clone(h)};}return{ok:true,warning,elapsed:now-a.enteredAt,overstayed:now>=a.enteredAt+LIMIT,phase:a.phase};}
  function requestDeparture(id){const a=state.active;if(!a||a.vehicleId!==id)return fail('no_matching_visit');const result=update();if(!result.ok||result.departed)return result;const duplicate=a.phase==='departing';a.phase='departing';return{ok:true,id:a.id,duplicate,warning:result.warning};}
  function restore(next){const n=normalize(next,adapter.now());if(!n)return fail('invalid_state');if(n.active){const p=physical(n.active.vehicleId);if(!p||!p.exists||!p.overlaps||!p.legal||p.occupants.some(id=>id!==n.active.vehicleId)||(n.active.phase==='parked'&&(!p.stopped||!p.contained)))return fail('physical_restore_not_confirmed');}state=n;return{ok:true};}
  if(state.active&&!restore(state).ok)throw Error('Active parking requires reconstructed physical vehicle.');
  return{state:()=>clone(state),snapshot:()=>clone(state),enter,requestDeparture,update,restore};
 }
 const api={BAY,LIMIT,HISTORY,fresh,validate,normalize,create};root.StreetParkingRules=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
