/* Native I14 social memory state. Keeps the existing fushi-progress format and local key. */
(function(SP){
 'use strict';
 const PS=SP.progressSave,Social=window.SocialEncounters,Live=SP.socialEncountersLive;
 if(!PS||!Social||!Live?.formal||!Live.candidate?.engine)throw Error('正式交谈存档须在原生存档与正式交谈注册后加载。');
 if(SP.socialEncountersSave)return;
 const engine=Live.candidate.engine,own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const fail=()=>{throw Error('街头交谈记录或主状态关联无效');};
 function checked(state,ps,at){
  const lin=ps.communitySocial?.lin||null;
  if(lin&&(!Number.isSafeInteger(lin.lastGreetingDay)||lin.lastGreetingDay>Math.floor(at/1440)||
    !Number.isSafeInteger(lin.lastSharedDay)||lin.lastSharedDay>Math.floor(at/1440)))fail();
  if(!Social.validate(state,at,lin))fail();
  const n=Social.normalize(state,at);if(!n)fail();
  if([n.nextSession,n.nextEvent,n.nextMessage].some(x=>x>1e12))fail();
  // IDs and timestamps describe the same ordered world history. Negative deltas
  // or a reordered timeline must not be silently accepted as dialogue history.
  for(const rows of [n.events,n.transcript]){
   let lastAt=-1;for(const row of rows){if(row.at<lastAt)fail();lastAt=row.at;}
  }
  for(const e of n.events){
   if(e.kind!=='greeting'&&e.delta!==0)fail();
   if(!n.people[e.target])fail();
   if(e.kind!=='greeting'){
    const parts=e.key.split(':');if(!parts.slice(1).every(x=>/^\d+$/.test(x)&&Number.isSafeInteger(Number(x))))fail();
   }
  }
  for(const m of n.transcript)if(!n.people[m.target])fail();
  return n;
 }
 function captureState(ps,at){return checked(engine.snapshot(),ps,at);}
 function prepareState(ps,contentVersion,at){
  if(!own(ps,'socialEncounters')){
   if(['I13','I14','I15','I16','I17','I18'].includes(contentVersion))fail();
   ps.socialEncounters=Social.fresh(ps.communitySocial?.lin||null);
  }else if((contentVersion==='I13'&&ps.socialEncounters?.version!==2)||(['I14','I15','I16','I17','I18'].includes(contentVersion)&&ps.socialEncounters?.version!==3))fail();
  ps.socialEncounters=checked(ps.socialEncounters,ps,at);
  return ps.socialEncounters;
 }
 function applyCommitted(ps,at){
  const state=checked(ps.socialEncounters,ps,at);
  Live.close();const r=engine.restore(state);if(!r.ok)throw Error(r.reason||'街头交谈状态恢复失败');
  ps.socialEncounters=state;
 }
 SP.socialEncountersSave={captureState,prepareState,applyCommitted,checked,format:'fushi-progress',field:'payload.ps.socialEncounters',version:3};
 // Existing housing/residential wrappers remain outside the native commit. An
 // explicit valid load may end dialogue; an invalid import must not close it or
 // alter any state. Native commit/rollback includes the social restore hook.
 const restore0=PS.restore;
 PS.restore=function(text){
  if(Live.isOpen()){
   const inspected=PS.inspect(text);if(!inspected.ok)return inspected;
   Live.close();
  }
  return restore0.apply(PS,arguments);
 };
})(window.SP);
