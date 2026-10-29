/* Native save extension: preserve city incidents, never infer past incidents. */
(function(SP){
 'use strict';
 const PS=SP.progressSave,M=window.CityIncidentsModel,R=SP.cityIncidents;
 if(!PS||!M||!['fresh','validate','normalize'].every(k=>typeof M[k]==='function')||!R||!['fresh','prepare','snapshot','restore','resetRuntime','canSave'].every(k=>typeof R[k]==='function'))throw Error('城市现场存档须在规则、原生存档和现场模块注册后加载。');
 if(SP.cityIncidentsSave)return;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function checked(state,at){const next=R.prepare(state,at);if(!next)throw Error('城市现场记录、位置或救援阶段无效。');return next;}
 function captureState(ps,at){const ready=R.canSave();if(ready!==true&&ready?.ok!==true)throw Error(ready?.reason||'城市现场正在切换阶段，请稍后保存。');return checked(R.snapshot(),at);}
 function prepareState(ps,extensions,at){
  if(extensions!==undefined&&(!extensions||typeof extensions!=='object'||Array.isArray(extensions)||!Object.keys(extensions).length||Object.keys(extensions).some(k=>!['socialExchange','cityIncidents','sharedMobility','npcDailyLife','mobilityOperations','neighborhoodStore','environmentState','storeSupply','sharedHome','socialRetrospection','mediaNews','heardNotes','leaseTalk','workTalk','fixtureTalk','socialFlow','animals','neighborDay','vendorDay','routineWork','residentMemory','employment','household','playerWork','commerce','wetMarket'].includes(k)||extensions[k]!==1)))throw Error('存档扩展声明无效或版本不兼容。');
  const hasState=own(ps,'cityIncidents'),hasMarker=extensions!==undefined&&own(extensions,'cityIncidents');
  if(hasState!==hasMarker)throw Error('存档城市现场扩展声明与记录不一致。');
  if(!hasMarker){ps.cityIncidents=checked(R.fresh(at),at);return true;}
  ps.cityIncidents=checked(ps.cityIncidents,at);return false;
 }
 function applyCommitted(ps,at){const next=checked(ps.cityIncidents,at);R.resetRuntime();const result=R.restore(next);if(!result?.ok)throw Error(result?.reason||'城市现场恢复失败。');ps.cityIncidents=next;}
 SP.cityIncidentsSave={checked,captureState,prepareState,applyCommitted,format:'fushi-progress',field:'payload.ps.cityIncidents',version:1};
})(window.SP);
