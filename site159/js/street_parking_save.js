/* Native parking snapshot: pure validation before commit, rebuild after traffic reset. */
(function(SP){
 'use strict';
 const PS=SP.progressSave,P=SP.streetParking;
 if(!PS||!P||!['fresh','snapshot','prepare','restore','canSave'].every(k=>typeof P[k]==='function'))
  throw Error('停车存档须在原生存档和停车 live 注册后加载。');
 if(SP.streetParkingSave)return;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function checked(state,at){const next=P.prepare(state,at);if(!next)throw Error('停车记录、车辆标识或时序无效。');return next;}
 function captureState(ps,at){const gate=P.canSave();if(!gate?.ok)throw Error(gate?.reason||'车辆正在机动，请停稳后再保存。');return checked(P.snapshot(),at);}
 function prepareState(ps,sourceVersion,at){
  if(!own(ps,'streetParking')){if(sourceVersion==='I18'||(sourceVersion==='I16'&&!own(ps,'canteenSupply')))throw Error('存档缺少停车记录。');ps.streetParking=P.fresh();}
  ps.streetParking=checked(ps.streetParking,at);return ps.streetParking;
 }
 function applyCommitted(ps,at){const next=checked(ps.streetParking,at),r=P.restore(next);if(!r?.ok)throw Error(r?.reason||'停车车辆重建失败。');ps.streetParking=next;}
 SP.streetParkingSave={captureState,prepareState,applyCommitted,checked,format:'fushi-progress',field:'payload.ps.streetParking',version:1};
})(window.SP);
