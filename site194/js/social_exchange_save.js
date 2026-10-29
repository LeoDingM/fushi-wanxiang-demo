/* Optional native-save extension. Absence on both sides identifies a pre-extension save. */
(function(SP){
 'use strict';
 const PS=SP.progressSave,M=window.SocialExchangeModel,R=SP.socialExchange;
 if(!PS||!M||!['fresh','validate','normalize'].every(k=>typeof M[k]==='function')||!R||!['snapshot','restore','resetRuntime'].every(k=>typeof R[k]==='function'))throw Error('赠借存档须在规则、原生存档和赠借模块注册后加载。');
 if(SP.socialExchangeSave)return;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function checked(state,at){if(!M.validate(state,at))throw Error('赠借记录、金额、物品或借还账目无效。');const next=M.normalize(state,at);if(!next)throw Error('赠借状态无法规范化。');return next;}
 function captureState(ps,at){if(R.canSave&&R.canSave()!==true)throw Error('赠借交易尚未完成，请稍后保存。');return checked(R.snapshot(),at);}
 function prepareState(ps,extensions,at){
  const hasState=own(ps,'socialExchange'),hasMarker=extensions!==undefined&&own(extensions||{},'socialExchange');
  if(extensions!==undefined&&(!extensions||typeof extensions!=='object'||Array.isArray(extensions)||!Object.keys(extensions).length||Object.keys(extensions).some(k=>!['socialExchange','cityIncidents','sharedMobility','npcDailyLife','mobilityOperations','neighborhoodStore','environmentState','storeSupply','sharedHome','socialRetrospection','mediaNews','heardNotes','leaseTalk','workTalk','fixtureTalk','socialFlow','animals','neighborDay','vendorDay','routineWork','residentMemory','employment','household','playerWork','commerce','wetMarket'].includes(k)||extensions[k]!==1)))throw Error('存档扩展声明无效或版本不兼容。');
  if(hasMarker!==hasState)throw Error('存档赠借扩展声明与记录不一致。');
  if(!hasMarker){ps.socialExchange=checked(M.fresh(),at);return true;}
  ps.socialExchange=checked(ps.socialExchange,at);return false;
 }
 function applyCommitted(ps,at){const next=checked(ps.socialExchange,at);R.resetRuntime();const result=R.restore(next);if(!result?.ok)throw Error(result?.reason||'赠借记录恢复失败。');ps.socialExchange=next;}
 SP.socialExchangeSave={checked,captureState,prepareState,applyCommitted,format:'fushi-progress',field:'payload.ps.socialExchange',version:1};
})(window.SP);
